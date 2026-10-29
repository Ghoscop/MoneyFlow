
import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription, finalize } from 'rxjs';
import { MovimentacaoService } from '../../core/services/movimentacao.service';
import { Movimentacao } from '../../core/models/movimentacao';

interface MovimentacaoResumo extends Movimentacao {
  icone: string;
}

interface ResumoCategoria {
  nome: string;
  valor: number;
  percentual: number;
}

interface ResumoMes {
  nome: string;
  receitas: number;
  despesas: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CurrencyPipe, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit, OnDestroy {
  private readonly service = inject(MovimentacaoService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();

  movimentacoes: MovimentacaoResumo[] = [];
  movimentacoesRecentes: MovimentacaoResumo[] = [];
  categorias: ResumoCategoria[] = [];
  meses: ResumoMes[] = [];

  saldo = 0;
  receitas = 0;
  despesas = 0;
  carregando = false;
  erro = '';

  readonly hoje = new Date();

  private requisicaoEmAndamento = false;

  get nomeMesAtual(): string {
    return new Intl.DateTimeFormat('pt-BR', {
      month: 'long',
      year: 'numeric'
    }).format(this.hoje);
  }

  get totalMes(): number {
    return this.receitas - this.despesas;
  }

  get maiorBarra(): number {
    return Math.max(
      1,
      ...this.meses.flatMap(m => [m.receitas, m.despesas])
    );
  }

  get totalDespesasCategorias(): number {
    return this.categorias.reduce(
      (total, categoria) => total + categoria.valor,
      0
    );
  }

  get gradienteCategorias(): string {
    if (this.totalDespesasCategorias === 0) {
      return 'conic-gradient(#e5e7eb 0% 100%)';
    }

    const cores = [
      '#4ade80',
      '#60a5fa',
      '#a78bfa',
      '#fbbf24',
      '#f472b6',
      '#22d3ee',
      '#fb7185',
      '#a3e635'
    ];

    let inicio = 0;

    const partes = this.categorias.map((categoria, indice) => {
      const fim = inicio + categoria.percentual;
      const parte = `${cores[indice % cores.length]} ${inicio}% ${fim}%`;
      inicio = fim;
      return parte;
    });

    return `conic-gradient(${partes.join(', ')})`;
  }

  ngOnInit(): void {
    this.carregarDados();

    this.subscriptions.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          if (this.router.url === '/' || this.router.url === '') {
            this.carregarDados();
          }
        })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  carregarDados(): void {
    if (this.requisicaoEmAndamento) {
      return;
    }

    this.requisicaoEmAndamento = true;
    this.carregando = true;
    this.erro = '';

    this.subscriptions.add(
      this.service.listarTodas()
        .pipe(
          finalize(() => {
            this.requisicaoEmAndamento = false;
            this.carregando = false;
            this.cdr.markForCheck();
          })
        )
        .subscribe({
          next: dados => {
            this.movimentacoes = dados
              .map(item => ({
                ...item,
                icone: item.tipo === 'RECEITA' ? '↙' : '▤'
              }))
              .sort((a, b) =>
                this.converterData(b.data).getTime() -
                this.converterData(a.data).getTime() ||
                b.id - a.id
              );

            this.calcularResumo();
            this.cdr.markForCheck();
          },
          error: erro => {
            console.error('Erro ao carregar o dashboard:', erro);
            this.erro =
              'Não foi possível carregar os dados. Verifique se o backend está funcionando.';
          }
        })
    );
  }

  private calcularResumo(): void {
    const anoAtual = this.hoje.getFullYear();
    const mesAtual = this.hoje.getMonth();

    const movimentacoesMes = this.movimentacoes.filter(item => {
      const data = this.converterData(item.data);

      return data.getFullYear() === anoAtual &&
        data.getMonth() === mesAtual;
    });

    this.receitas = movimentacoesMes
      .filter(item => item.tipo === 'RECEITA')
      .reduce((total, item) => total + Number(item.valor || 0), 0);

    this.despesas = movimentacoesMes
      .filter(item => item.tipo === 'DESPESA')
      .reduce((total, item) => total + Number(item.valor || 0), 0);

    this.saldo = this.movimentacoes.reduce((total, item) => {
      const valor = Number(item.valor || 0);
      return total + (item.tipo === 'RECEITA' ? valor : -valor);
    }, 0);

    this.movimentacoesRecentes = this.movimentacoes.slice(0, 5);

    this.calcularCategorias(movimentacoesMes);
    this.calcularMeses();
  }

  private calcularCategorias(movimentacoesMes: MovimentacaoResumo[]): void {
    const despesasPorCategoria = movimentacoesMes
      .filter(item => item.tipo === 'DESPESA')
      .reduce((acc, movimentacao) => {
        const categoria = movimentacao.categoria?.trim() || 'Outros';
        const valor = Number(movimentacao.valor || 0);

        acc[categoria] = (acc[categoria] || 0) + valor;

        return acc;
      }, {} as Record<string, number>);

    const totalDespesas = Object.values(despesasPorCategoria)
      .reduce((total, valor) => total + valor, 0);

    this.categorias = Object.entries(despesasPorCategoria)
      .map(([nome, valor]) => ({
        nome,
        valor,
        percentual: totalDespesas > 0
          ? (valor / totalDespesas) * 100
          : 0
      }))
      .sort((a, b) => b.valor - a.valor);
  }

  private calcularMeses(): void {
    const nomesMeses = [
      'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
    ];

    const resultado: ResumoMes[] = [];

    for (let deslocamento = 5; deslocamento >= 0; deslocamento--) {
      const referencia = new Date(
        this.hoje.getFullYear(),
        this.hoje.getMonth() - deslocamento,
        1
      );

      const ano = referencia.getFullYear();
      const mes = referencia.getMonth();

      const doMes = this.movimentacoes.filter(item => {
        const data = this.converterData(item.data);

        return data.getFullYear() === ano &&
          data.getMonth() === mes;
      });

      const totalReceitas = doMes
        .filter(item => item.tipo === 'RECEITA')
        .reduce((total, item) => total + Number(item.valor || 0), 0);

      const totalDespesas = doMes
        .filter(item => item.tipo === 'DESPESA')
        .reduce((total, item) => total + Number(item.valor || 0), 0);

      resultado.push({
        nome: nomesMeses[mes],
        receitas: totalReceitas,
        despesas: totalDespesas
      });
    }

    this.meses = resultado;
  }

  alturaBarra(valor: number): number {
    return (valor / this.maiorBarra) * 100;
  }

  private converterData(valor: string): Date {
    const data = valor.substring(0, 10);
    const [ano, mes, dia] = data.split('-').map(Number);

    return new Date(ano, mes - 1, dia);
  }
}
