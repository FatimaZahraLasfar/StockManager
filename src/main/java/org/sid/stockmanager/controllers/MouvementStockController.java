// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/controllers/MouvementStockController.java
package org.sid.stockmanager.controllers;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.MouvementStock;
import org.sid.stockmanager.repositories.MouvementStockRepository;
import org.sid.stockmanager.services.interfaces.IMouvementStockService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/mouvements")
@CrossOrigin("*")
@RequiredArgsConstructor
public class MouvementStockController {

    private final IMouvementStockService mouvementStockService;
    private final MouvementStockRepository mouvementStockRepository;

    @GetMapping
    public ResponseEntity<List<MouvementStock>> getAll() {
        return ResponseEntity.ok(mouvementStockService.getAll());
    }

    @GetMapping("/produit/{produitId}")
    public ResponseEntity<List<MouvementStock>> getByProduit(@PathVariable Long produitId) {
        return ResponseEntity.ok(mouvementStockRepository.findByProduitId(produitId));
    }

    @PostMapping("/entree")
    public ResponseEntity<MouvementStock> entreeStock(@RequestBody MouvementStockRequest request) {
        if (isInvalidRequest(request)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            MouvementStock mouvementStock = mouvementStockService.entreeStock(
                    request.getProduitId(),
                    request.getQuantite(),
                    request.getUserId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(mouvementStock);
        } catch (RuntimeException exception) {
            return handleMouvementException(exception);
        }
    }

    @PostMapping("/sortie")
    public ResponseEntity<MouvementStock> sortieStock(@RequestBody MouvementStockRequest request) {
        if (isInvalidRequest(request)) {
            return ResponseEntity.badRequest().build();
        }

        try {
            MouvementStock mouvementStock = mouvementStockService.sortieStock(
                    request.getProduitId(),
                    request.getQuantite(),
                    request.getUserId()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(mouvementStock);
        } catch (RuntimeException exception) {
            return handleMouvementException(exception);
        }
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<MouvementStock>> getByType(@PathVariable String type) {
        if (!"ENTREE".equalsIgnoreCase(type) && !"SORTIE".equalsIgnoreCase(type)) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(mouvementStockRepository.findByType(type.toUpperCase()));
    }

    private boolean isInvalidRequest(MouvementStockRequest request) {
        return request == null
                || request.getProduitId() == null
                || request.getUserId() == null
                || request.getQuantite() == null
                || request.getQuantite() <= 0;
    }

    private ResponseEntity<MouvementStock> handleMouvementException(RuntimeException exception) {
        if ("Stock insuffisant".equals(exception.getMessage())) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.notFound().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MouvementStockRequest {

        private Long produitId;

        private Integer quantite;

        private Long userId;
    }
}
