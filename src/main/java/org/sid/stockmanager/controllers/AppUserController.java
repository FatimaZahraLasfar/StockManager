// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/controllers/AppUserController.java
package org.sid.stockmanager.controllers;

import lombok.RequiredArgsConstructor;
import org.sid.stockmanager.entities.AppUser;
import org.sid.stockmanager.services.interfaces.IAppUserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
@RequiredArgsConstructor
public class AppUserController {

    private final IAppUserService appUserService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<AppUser>> getAll() {
        return ResponseEntity.ok(appUserService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppUser> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(appUserService.getById(id));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<AppUser> create(@RequestBody AppUser appUser) {
        if (appUser.getMotDePasse() == null || appUser.getMotDePasse().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        appUser.setMotDePasse(passwordEncoder.encode(appUser.getMotDePasse()));
        AppUser savedAppUser = appUserService.save(appUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAppUser);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppUser> update(@PathVariable Long id, @RequestBody AppUser appUser) {
        try {
            if (appUser.getMotDePasse() != null && !appUser.getMotDePasse().isBlank()) {
                appUser.setMotDePasse(passwordEncoder.encode(appUser.getMotDePasse()));
            }

            return ResponseEntity.ok(appUserService.update(id, appUser));
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        try {
            appUserService.delete(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException exception) {
            return ResponseEntity.notFound().build();
        }
    }
}
