package com.moneyflow.controller;

import com.moneyflow.entity.Movimentacao;
import com.moneyflow.entity.TipoMovimentacao;
import com.moneyflow.service.MovimentacaoService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
@CrossOrigin(origins = "http://localhost:4200")
public class MovimentacaoController {

    private final MovimentacaoService service;

    public MovimentacaoController(MovimentacaoService service) {
        this.service = service;
    }

    @GetMapping
    public List<Movimentacao> listarTodas() {
        return service.listarTodas();
    }

    @GetMapping("/{id}")
    public Movimentacao buscarPorId(@PathVariable Long id) {
        try {
            return service.buscarPorId(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, e.getMessage()
            );
        }
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Movimentacao criar(@Valid @RequestBody Movimentacao movimentacao) {
        return service.criar(movimentacao);
    }

    @PutMapping("/{id}")
    public Movimentacao atualizar(
            @PathVariable Long id,
            @Valid @RequestBody Movimentacao movimentacao
    ) {
        try {
            return service.atualizar(id, movimentacao);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, e.getMessage()
            );
        }
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@PathVariable Long id) {
        try {
            service.excluir(id);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND, e.getMessage()
            );
        }
    }

    @GetMapping("/tipo/{tipo}")
    public List<Movimentacao> listarPorTipo(
            @PathVariable TipoMovimentacao tipo
    ) {
        return service.listarPorTipo(tipo);
    }

    @GetMapping("/periodo")
    public List<Movimentacao> listarPorPeriodo(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate inicio,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fim
    ) {
        try {
            return service.listarPorPeriodo(inicio, fim);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, e.getMessage()
            );
        }
    }
}
