
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Movimentacao,
  MovimentacaoRequest,
  TipoMovimentacao
} from '../models/movimentacao';

@Injectable({
  providedIn: 'root'
})
export class MovimentacaoService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/movimentacoes';

  listarTodas(): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(this.apiUrl);
  }

  criar(dados: MovimentacaoRequest): Observable<Movimentacao> {
    return this.http.post<Movimentacao>(this.apiUrl, dados);
  }

  atualizar(
    id: number,
    dados: MovimentacaoRequest
  ): Observable<Movimentacao> {
    return this.http.put<Movimentacao>(`${this.apiUrl}/${id}`, dados);
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  listarPorTipo(tipo: TipoMovimentacao): Observable<Movimentacao[]> {
    return this.http.get<Movimentacao[]>(`${this.apiUrl}/tipo/${tipo}`);
  }
}
