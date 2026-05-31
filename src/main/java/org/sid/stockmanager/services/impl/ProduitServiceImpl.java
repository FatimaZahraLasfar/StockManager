// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/impl/ProduitServiceImpl.java
package org.sid.stockmanager.services.impl;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.Produit;
import org.sid.stockmanager.repositories.ProduitRepository;
import org.sid.stockmanager.services.interfaces.IProduitService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class ProduitServiceImpl implements IProduitService {

    private final ProduitRepository produitRepository;

    @Override
    public List<Produit> getAll() {
        return produitRepository.findAll();
    }

    @Override
    public Produit getById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));
    }

    @Override
    public Produit save(Produit produit) {
        return produitRepository.save(produit);
    }

    @Override
    public Produit update(Long id, Produit produit) {
        Produit existingProduit = getById(id);
        existingProduit.setNom(produit.getNom());
        existingProduit.setDescription(produit.getDescription());
        existingProduit.setPrix(produit.getPrix());
        existingProduit.setQuantiteStock(produit.getQuantiteStock());
        existingProduit.setCategorie(produit.getCategorie());
        existingProduit.setFournisseur(produit.getFournisseur());
        return produitRepository.save(existingProduit);
    }

    @Override
    public void delete(Long id) {
        Produit existingProduit = getById(id);
        produitRepository.delete(existingProduit);
    }

    @Override
    public List<Produit> searchByNom(String nom) {
        return produitRepository.findByNomContainingIgnoreCase(nom);
    }

    @Override
    public List<Produit> getByCategorie(Long categorieId) {
        return produitRepository.findByCategorieId(categorieId);
    }

    @Override
    public List<Produit> getProduitsBassStock(Integer seuil) {
        return produitRepository.findByQuantiteStockLessThan(seuil);
    }
}
