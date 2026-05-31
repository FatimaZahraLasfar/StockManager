// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/repositories/MouvementStockRepository.java
package org.sid.stockmanager.repositories;

import org.sid.stockmanager.entities.MouvementStock;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MouvementStockRepository extends JpaRepository<MouvementStock, Long> {

    List<MouvementStock> findByProduitId(Long produitId);

    List<MouvementStock> findByType(String type);

    List<MouvementStock> findByOrderByDateMouvementDesc();
}
