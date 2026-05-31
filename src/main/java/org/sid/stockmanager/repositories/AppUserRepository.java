// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/repositories/AppUserRepository.java
package org.sid.stockmanager.repositories;

import org.sid.stockmanager.entities.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmail(String email);
}
