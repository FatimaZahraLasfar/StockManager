// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/interfaces/ICategorieService.java
package org.sid.stockmanager.services.interfaces;

import org.sid.stockmanager.entities.Categorie;

import java.util.List;

public interface ICategorieService {

    List<Categorie> getAll();

    Categorie getById(Long id);

    Categorie save(Categorie categorie);

    Categorie update(Long id, Categorie categorie);

    void delete(Long id);
}
