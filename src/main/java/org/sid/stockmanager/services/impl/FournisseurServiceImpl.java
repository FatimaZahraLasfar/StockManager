// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/impl/FournisseurServiceImpl.java
package org.sid.stockmanager.services.impl;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.Fournisseur;
import org.sid.stockmanager.repositories.FournisseurRepository;
import org.sid.stockmanager.services.interfaces.IFournisseurService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class FournisseurServiceImpl implements IFournisseurService {

    private final FournisseurRepository fournisseurRepository;

    @Override
    public List<Fournisseur> getAll() {
        return fournisseurRepository.findAll();
    }

    @Override
    public Fournisseur getById(Long id) {
        return fournisseurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fournisseur introuvable"));
    }

    @Override
    public Fournisseur save(Fournisseur fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    @Override
    public Fournisseur update(Long id, Fournisseur fournisseur) {
        Fournisseur existingFournisseur = getById(id);
        existingFournisseur.setNom(fournisseur.getNom());
        existingFournisseur.setTelephone(fournisseur.getTelephone());
        existingFournisseur.setEmail(fournisseur.getEmail());
        existingFournisseur.setAdresse(fournisseur.getAdresse());
        return fournisseurRepository.save(existingFournisseur);
    }

    @Override
    public void delete(Long id) {
        Fournisseur existingFournisseur = getById(id);
        fournisseurRepository.delete(existingFournisseur);
    }
}
