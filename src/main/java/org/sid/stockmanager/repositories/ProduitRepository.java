// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/repositories/ProduitRepository.java
package org.sid.stockmanager.repositories;

import org.sid.stockmanager.entities.Produit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduitRepository extends JpaRepository<Produit, Long> {

    List<Produit> findByNomContainingIgnoreCase(String nom);

    List<Produit> findByCategorieId(Long categorieId);

    List<Produit> findByFournisseurId(Long fournisseurId);

    List<Produit> findByQuantiteStockLessThan(Integer seuil);
}
