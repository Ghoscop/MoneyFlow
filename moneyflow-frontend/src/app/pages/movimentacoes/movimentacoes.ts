
import {
  Component,
  OnInit,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
  Movimentacao,
  MovimentacaoRequest,
  TipoMovimentacao
} from '../../core/models/movimentacao';
import { MovimentacaoService } from '../../core/services/movimentacao.service';

@Component({
  selector: 'app-movimentacoes',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './movimentacoes.html',
  styleUrl: './movimentacoes.css'
})
export class Movimentacoes implements OnInit {
  private readonly service = inject(MovimentacaoService);
  private readonly cdr = inject(ChangeDetectorRef);

  filtro = 'TODOS';
  busca = '';
  mensagem = '';
  editandoId: number | null = null;
  carregando = false;
  salvando = false;

  formulario = this.formularioVazio();
  movimentacoes: Movimentacao[] = [];

  ngOnInit(): void {
    this.carregarMovimentacoes();
  }

  formularioVazio() {
    return {
      descricao: '',
      categoria: '',
      valor: null as number | null,
      data: this.dataAtual(),
      tipo: 'DESPESA' as TipoMovimentacao,
      observacao: ''
    };
  }

  private dataAtual(): string {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  carregarMovimentacoes(): void {
    if (this.carregando) {
      return;
    }

    this.carregando = true;
    this.mensagem = '';
    this.cdr.detectChanges();

    this.service.listarTodas()
      .pipe(
        finalize(() => {
          this.carregando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: dados => {
          this.movimentacoes = [...dados].sort(
            (a, b) => b.data.localeCompare(a.data) || b.id - a.id
          );

          this.cdr.detectChanges();
        },
        error: erro => {
          console.error('Erro ao carregar movimentações:', erro);

          this.mensagem = erro.status === 0
            ? 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.'
            : 'Não foi possível carregar as movimentações.';

          this.cdr.detectChanges();
        }
      });
  }

  get listaFiltrada(): Movimentacao[] {
    const termo = this.busca.trim().toLocaleLowerCase('pt-BR');

    return this.movimentacoes.filter(item => {
      const correspondeTipo =
        this.filtro === 'TODOS' || item.tipo === this.filtro;

      const descricao = (item.descricao ?? '').toLocaleLowerCase('pt-BR');
      const categoria = (item.categoria ?? '').toLocaleLowerCase('pt-BR');

      const correspondeBusca =
        descricao.includes(termo) || categoria.includes(termo);

      return correspondeTipo && correspondeBusca;
    });
  }

  get totalReceitas(): number {
    return this.movimentacoes
      .filter(item => item.tipo === 'RECEITA')
      .reduce((total, item) => total + Number(item.valor), 0);
  }

  get totalDespesas(): number {
    return this.movimentacoes
      .filter(item => item.tipo === 'DESPESA')
      .reduce((total, item) => total + Number(item.valor), 0);
  }

  get saldo(): number {
    return this.totalReceitas - this.totalDespesas;
  }

  salvar(): void {
    if (this.salvando) {
      return;
    }

    this.mensagem = '';

    const descricao = this.formulario.descricao.trim();
    const categoria = this.formulario.categoria.trim();
    const valor = Number(this.formulario.valor);
    const data = this.formulario.data;

    if (
      !descricao ||
      !categoria ||
      !data ||
      this.formulario.valor === null ||
      this.formulario.valor === undefined
    ) {
      this.mensagem = 'Preencha todos os campos obrigatórios.';
      return;
    }

    if (!Number.isFinite(valor) || valor <= 0) {
      this.mensagem = 'Informe um valor maior que zero.';
      return;
    }

    if (!this.dataValida(data)) {
      this.mensagem = 'Informe uma data válida.';
      return;
    }

    const dados: MovimentacaoRequest = {
      descricao,
      categoria,
      valor,
      data,
      tipo: this.formulario.tipo,
      observacao: this.formulario.observacao.trim() || undefined
    };

    this.salvando = true;
    this.cdr.detectChanges();

    const requisicao = this.editandoId !== null
      ? this.service.atualizar(this.editandoId, dados)
      : this.service.criar(dados);

    requisicao
      .pipe(
        finalize(() => {
          this.salvando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          this.cancelarEdicao();
          this.carregarMovimentacoes();
          this.cdr.detectChanges();
        },
        error: erro => {
          console.error('Erro ao salvar movimentação:', erro);

          this.mensagem = erro.status === 0
            ? 'Não foi possível conectar ao servidor. Confira se o backend está rodando.'
            : erro.error?.detail ||
              erro.error?.message ||
              'Não foi possível salvar a movimentação.';

          this.cdr.detectChanges();
        }
      });
  }

  private dataValida(data: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return false;
    }

    const [ano, mes, dia] = data.split('-').map(Number);
    const verificacao = new Date(ano, mes - 1, dia);

    return verificacao.getFullYear() === ano &&
      verificacao.getMonth() === mes - 1 &&
      verificacao.getDate() === dia;
  }

  editar(item: Movimentacao): void {
    this.editandoId = item.id;

    this.formulario = {
      descricao: item.descricao,
      categoria: item.categoria ?? '',
      valor: Number(item.valor),
      data: item.data.substring(0, 10),
      tipo: item.tipo,
      observacao: item.observacao ?? ''
    };

    this.mensagem = '';
    this.cdr.detectChanges();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  excluir(item: Movimentacao): void {
    const confirmado = window.confirm(
      `Deseja excluir a movimentação "${item.descricao}"?`
    );

    if (!confirmado) {
      return;
    }

    this.mensagem = '';

    this.service.excluir(item.id).subscribe({
      next: () => {
        if (this.editandoId === item.id) {
          this.cancelarEdicao();
        }

        this.carregarMovimentacoes();
        this.cdr.detectChanges();
      },
      error: erro => {
        console.error('Erro ao excluir movimentação:', erro);

        this.mensagem = erro.status === 0
          ? 'Não foi possível conectar ao servidor.'
          : 'Não foi possível excluir a movimentação.';

        this.cdr.detectChanges();
      }
    });
  }

  cancelarEdicao(): void {
    this.editandoId = null;
    this.formulario = this.formularioVazio();
    this.mensagem = '';
    this.cdr.detectChanges();
  }
}
