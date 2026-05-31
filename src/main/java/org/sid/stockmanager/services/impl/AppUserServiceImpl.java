// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/impl/AppUserServiceImpl.java
package org.sid.stockmanager.services.impl;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.AppUser;
import org.sid.stockmanager.repositories.AppUserRepository;
import org.sid.stockmanager.services.interfaces.IAppUserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class AppUserServiceImpl implements IAppUserService {

    private final AppUserRepository appUserRepository;

    @Override
    public List<AppUser> getAll() {
        return appUserRepository.findAll();
    }

    @Override
    public AppUser getById(Long id) {
        return appUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    @Override
    public AppUser save(AppUser appUser) {
        return appUserRepository.save(appUser);
    }

    @Override
    public AppUser update(Long id, AppUser appUser) {
        AppUser existingAppUser = getById(id);
        existingAppUser.setNom(appUser.getNom());
        existingAppUser.setEmail(appUser.getEmail());
        existingAppUser.setMotDePasse(appUser.getMotDePasse());
        existingAppUser.setRole(appUser.getRole());
        return appUserRepository.save(existingAppUser);
    }

    @Override
    public void delete(Long id) {
        AppUser existingAppUser = getById(id);
        appUserRepository.delete(existingAppUser);
    }

    @Override
    public AppUser loadUserByEmail(String email) {
        return appUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }
}
