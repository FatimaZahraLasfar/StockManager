// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/impl/CategorieServiceImpl.java
package org.sid.stockmanager.services.impl;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.Categorie;
import org.sid.stockmanager.repositories.CategorieRepository;
import org.sid.stockmanager.services.interfaces.ICategorieService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class CategorieServiceImpl implements ICategorieService {

    private final CategorieRepository categorieRepository;

    @Override
    public List<Categorie> getAll() {
        return categorieRepository.findAll();
    }

    @Override
    public Categorie getById(Long id) {
        return categorieRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categorie introuvable"));
    }

    @Override
    public Categorie save(Categorie categorie) {
        return categorieRepository.save(categorie);
    }

    @Override
    public Categorie update(Long id, Categorie categorie) {
        Categorie existingCategorie = getById(id);
        existingCategorie.setNom(categorie.getNom());
        existingCategorie.setDescription(categorie.getDescription());
        return categorieRepository.save(existingCategorie);
    }

    @Override
    public void delete(Long id) {
        Categorie existingCategorie = getById(id);
        categorieRepository.delete(existingCategorie);
    }
}
