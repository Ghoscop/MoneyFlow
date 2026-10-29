
export type TipoMovimentacao = 'RECEITA' | 'DESPESA';

export interface Movimentacao {
  id: number;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: TipoMovimentacao;
  observacao?: string;
}

export interface MovimentacaoRequest {
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: TipoMovimentacao;
  observacao?: string;
}
