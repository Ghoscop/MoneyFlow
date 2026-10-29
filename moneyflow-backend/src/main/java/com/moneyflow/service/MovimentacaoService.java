package com.moneyflow.service;

import com.moneyflow.entity.Movimentacao;
import com.moneyflow.entity.TipoMovimentacao;
import com.moneyflow.repository.MovimentacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository repository;

    public MovimentacaoService(MovimentacaoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Movimentacao> listarTodas() {
        return repository.findAllByOrderByDataDesc();
    }

    @Transactional(readOnly = true)
    public Movimentacao buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Movimentação não encontrada: " + id
                ));
    }

    @Transactional
    public Movimentacao criar(Movimentacao movimentacao) {
        movimentacao.setData(
                movimentacao.getData() != null
                        ? movimentacao.getData()
                        : LocalDate.now()
        );

        return repository.save(movimentacao);
    }

    @Transactional
    public Movimentacao atualizar(Long id, Movimentacao dados) {
        Movimentacao existente = buscarPorId(id);

        existente.setDescricao(dados.getDescricao());
        existente.setValor(dados.getValor());
        existente.setTipo(dados.getTipo());
        existente.setData(dados.getData());
        existente.setCategoria(dados.getCategoria());
        existente.setObservacao(dados.getObservacao());

        return repository.save(existente);
    }

    @Transactional
    public void excluir(Long id) {
        Movimentacao movimentacao = buscarPorId(id);
        repository.delete(movimentacao);
    }

    @Transactional(readOnly = true)
    public List<Movimentacao> listarPorTipo(TipoMovimentacao tipo) {
        return repository.findByTipoOrderByDataDesc(tipo);
    }

    @Transactional(readOnly = true)
    public List<Movimentacao> listarPorPeriodo(
            LocalDate inicio,
            LocalDate fim
    ) {
        if (inicio == null || fim == null || inicio.isAfter(fim)) {
            throw new IllegalArgumentException(
                    "Informe um período válido."
            );
        }

        return repository.findByDataBetweenOrderByDataDesc(inicio, fim);
    }
}
