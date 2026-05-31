// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/repositories/CategorieRepository.java
package org.sid.stockmanager.repositories;

import org.sid.stockmanager.entities.Categorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CategorieRepository extends JpaRepository<Categorie, Long> {

    Optional<Categorie> findByNom(String nom);
}
