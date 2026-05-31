// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/impl/MouvementStockServiceImpl.java
package org.sid.stockmanager.services.impl;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.AppUser;
import org.sid.stockmanager.entities.MouvementStock;
import org.sid.stockmanager.entities.Produit;
import org.sid.stockmanager.repositories.AppUserRepository;
import org.sid.stockmanager.repositories.MouvementStockRepository;
import org.sid.stockmanager.repositories.ProduitRepository;
import org.sid.stockmanager.services.interfaces.IMouvementStockService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class MouvementStockServiceImpl implements IMouvementStockService {

    private final MouvementStockRepository mouvementStockRepository;
    private final ProduitRepository produitRepository;
    private final AppUserRepository appUserRepository;

    @Override
    public List<MouvementStock> getAll() {
        return mouvementStockRepository.findAll();
    }

    @Override
    public MouvementStock getById(Long id) {
        return mouvementStockRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mouvement de stock introuvable"));
    }

    @Override
    public MouvementStock save(MouvementStock mouvementStock) {
        return mouvementStockRepository.save(mouvementStock);
    }

    @Override
    public MouvementStock update(Long id, MouvementStock mouvementStock) {
        MouvementStock existingMouvementStock = getById(id);
        existingMouvementStock.setType(mouvementStock.getType());
        existingMouvementStock.setQuantite(mouvementStock.getQuantite());
        existingMouvementStock.setProduit(mouvementStock.getProduit());
        existingMouvementStock.setUser(mouvementStock.getUser());
        return mouvementStockRepository.save(existingMouvementStock);
    }

    @Override
    public void delete(Long id) {
        MouvementStock existingMouvementStock = getById(id);
        mouvementStockRepository.delete(existingMouvementStock);
    }

    @Override
    public MouvementStock entreeStock(Long produitId, Integer quantite, Long userId) {
        Produit produit = getProduit(produitId);
        AppUser user = getUser(userId);

        produit.setQuantiteStock(produit.getQuantiteStock() + quantite);
        produitRepository.save(produit);

        MouvementStock mouvementStock = new MouvementStock();
        mouvementStock.setType("ENTREE");
        mouvementStock.setQuantite(quantite);
        mouvementStock.setProduit(produit);
        mouvementStock.setUser(user);

        return mouvementStockRepository.save(mouvementStock);
    }

    @Override
    public MouvementStock sortieStock(Long produitId, Integer quantite, Long userId) {
        Produit produit = getProduit(produitId);
        AppUser user = getUser(userId);

        if (produit.getQuantiteStock() < quantite) {
            throw new RuntimeException("Stock insuffisant");
        }

        produit.setQuantiteStock(produit.getQuantiteStock() - quantite);
        produitRepository.save(produit);

        MouvementStock mouvementStock = new MouvementStock();
        mouvementStock.setType("SORTIE");
        mouvementStock.setQuantite(quantite);
        mouvementStock.setProduit(produit);
        mouvementStock.setUser(user);

        return mouvementStockRepository.save(mouvementStock);
    }

    private Produit getProduit(Long produitId) {
        return produitRepository.findById(produitId)
                .orElseThrow(() -> new RuntimeException("Produit introuvable"));
    }

    private AppUser getUser(Long userId) {
        return appUserRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
