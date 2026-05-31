// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/controllers/DashboardController.java
package org.sid.stockmanager.controllers;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.MouvementStock;
import org.sid.stockmanager.repositories.CategorieRepository;
import org.sid.stockmanager.repositories.FournisseurRepository;
import org.sid.stockmanager.repositories.MouvementStockRepository;
import org.sid.stockmanager.repositories.ProduitRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
@RequiredArgsConstructor
public class DashboardController {

    private final ProduitRepository produitRepository;
    private final CategorieRepository categorieRepository;
    private final FournisseurRepository fournisseurRepository;
    private final MouvementStockRepository mouvementStockRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        List<MouvementStock> derniersMouvements = mouvementStockRepository.findByOrderByDateMouvementDesc()
                .stream()
                .limit(10)
                .toList();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalProduits", produitRepository.count());
        stats.put("totalCategories", categorieRepository.count());
        stats.put("totalFournisseurs", fournisseurRepository.count());
        stats.put("produitsEnRupture", produitRepository.findByQuantiteStockLessThan(5));
        stats.put("derniersMouvements", derniersMouvements);

        return ResponseEntity.ok(stats);
    }
}
