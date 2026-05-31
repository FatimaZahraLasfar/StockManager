// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/interfaces/IFournisseurService.java
package org.sid.stockmanager.services.interfaces;

import org.sid.stockmanager.entities.Fournisseur;

import java.util.List;

public interface IFournisseurService {

    List<Fournisseur> getAll();

    Fournisseur getById(Long id);

    Fournisseur save(Fournisseur fournisseur);

    Fournisseur update(Long id, Fournisseur fournisseur);

    void delete(Long id);
}
