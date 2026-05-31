// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/interfaces/IMouvementStockService.java
package org.sid.stockmanager.services.interfaces;

import org.sid.stockmanager.entities.MouvementStock;

import java.util.List;

public interface IMouvementStockService {

    List<MouvementStock> getAll();

    MouvementStock getById(Long id);

    MouvementStock save(MouvementStock mouvementStock);

    MouvementStock update(Long id, MouvementStock mouvementStock);

    void delete(Long id);

    MouvementStock entreeStock(Long produitId, Integer quantite, Long userId);

    MouvementStock sortieStock(Long produitId, Integer quantite, Long userId);
}
