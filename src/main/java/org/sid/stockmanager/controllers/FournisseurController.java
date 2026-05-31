// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/controllers/FournisseurController.java
package org.sid.stockmanager.controllers;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.Fournisseur;
import org.sid.stockmanager.repositories.FournisseurRepository;
import org.sid.stockmanager.services.interfaces.IFournisseurService;
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
@RequestMapping("/api/fournisseurs")
@CrossOrigin("*")
@RequiredArgsConstructor
public class FournisseurController {

    private final IFournisseurService fournisseurService;
    private final FournisseurRepository fournisseurRepository;

    @GetMapping
    public ResponseEntity<List<Fournisseur>> getAll() {
        return ResponseEntity.ok(fournisseurService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Fournisseur> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(fournisseurService.getById(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Fournisseur> create(@RequestBody Fournisseur fournisseur) {
        Fournisseur savedFournisseur = fournisseurService.save(fournisseur);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedFournisseur);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Fournisseur> update(@PathVariable Long id, @RequestBody Fournisseur fournisseur) {
        try {
            return ResponseEntity.ok(fournisseurService.update(id, fournisseur));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            fournisseurService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<Fournisseur>> searchByNom(@RequestParam String nom) {
        if (nom == null || nom.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok(fournisseurRepository.findByNomContainingIgnoreCase(nom));
    }
}
