package com.moneyflow.repository;

import com.moneyflow.entity.Movimentacao;
import com.moneyflow.entity.TipoMovimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findAllByOrderByDataDesc();

    List<Movimentacao> findByTipoOrderByDataDesc(TipoMovimentacao tipo);

    List<Movimentacao> findByDataBetweenOrderByDataDesc(
            LocalDate inicio,
            LocalDate fim
    );
}
