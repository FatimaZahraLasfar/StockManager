// C:/Users/soukaina/IdeaProjects/stockmanager/src/main/java/org/sid/stockmanager/services/interfaces/IAppUserService.java
package org.sid.stockmanager.services.interfaces;

import org.sid.stockmanager.entities.AppUser;

import java.util.List;

public interface IAppUserService {

    List<AppUser> getAll();

    AppUser getById(Long id);

    AppUser save(AppUser appUser);

    AppUser update(Long id, AppUser appUser);

    void delete(Long id);

    AppUser loadUserByEmail(String email);
}
