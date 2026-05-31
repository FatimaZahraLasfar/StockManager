// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/controllers/ProduitController.java
package org.sid.stockmanager.controllers;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.Produit;
import org.sid.stockmanager.services.interfaces.IProduitService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
@CrossOrigin("*")
@RequiredArgsConstructor
public class ProduitController {

    private final IProduitService produitService;

    @GetMapping
    public ResponseEntity<List<Produit>> getAll() {
        return ResponseEntity.ok(produitService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(produitService.getById(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Produit> create(@RequestBody Produit produit) {
        Produit savedProduit = produitService.save(produit);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedProduit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produit> update(@PathVariable Long id, @RequestBody Produit produit) {
        try {
            return ResponseEntity.ok(produitService.update(id, produit));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            produitService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Produit>> searchByNom(@RequestParam String nom) {
        if (nom == null || nom.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(produitService.searchByNom(nom));
    }

    @GetMapping("/categorie/{categorieId}")
    public ResponseEntity<List<Produit>> getByCategorie(@PathVariable Long categorieId) {
        return ResponseEntity.ok(produitService.getByCategorie(categorieId));
    }

    @GetMapping("/bas-stock")
    public ResponseEntity<List<Produit>> getProduitsBasStock(@RequestParam(defaultValue = "5") Integer seuil) {
        if (seuil == null || seuil < 0) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(produitService.getProduitsBassStock(seuil));
    }
}
