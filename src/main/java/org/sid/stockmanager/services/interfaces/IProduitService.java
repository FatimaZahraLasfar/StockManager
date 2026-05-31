// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/interfaces/IProduitService.java
package org.sid.stockmanager.services.interfaces;

import org.sid.stockmanager.entities.Produit;

import java.util.List;

public interface IProduitService {

    List<Produit> getAll();

    Produit getById(Long id);

    Produit save(Produit produit);

    Produit update(Long id, Produit produit);

    void delete(Long id);

    List<Produit> searchByNom(String nom);

    List<Produit> getByCategorie(Long categorieId);

    List<Produit> getProduitsBassStock(Integer seuil);
}
