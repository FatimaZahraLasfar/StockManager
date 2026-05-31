// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/repositories/FournisseurRepository.java
package org.sid.stockmanager.repositories;

import org.sid.stockmanager.entities.Fournisseur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FournisseurRepository extends JpaRepository<Fournisseur, Long> {

    List<Fournisseur> findByNomContainingIgnoreCase(String nom);
}
