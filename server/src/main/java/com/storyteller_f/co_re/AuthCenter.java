package com.storyteller_f.co_re;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import javax.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;

import com.storyteller_f.co_re.controller.APIController.LoginTuple;

import lombok.AllArgsConstructor;

@Component
public class AuthCenter {
    @AllArgsConstructor
    public static class AuthSession {
        public boolean newCreated;
        public String returnedKey;
    }

    public AuthSession tryLogin(LoginTuple tuple, Logger log) {
        try {
            String home = System.getProperty("user.home");
            String password = Files.readString(new File(home, "core-password").toPath()).trim();
            log.info("saved " + password + " input " + tuple.password + " " + password.length());
            if (password.equals(tuple.password)) {
                Path p = new File(home, "core-key").toPath();
                if (Files.exists(p)) {
                    return new AuthSession(false, Files.readString(p));
                } else {
                    String key = UUID.randomUUID().toString();
                    Files.writeString(p, key);
                    return new AuthSession(true, key);
                }

            } else {
                return new AuthSession(false, "invalid");
            }

        } catch (Exception e) {
            return new AuthSession(false, "");
        }
    }

    public boolean isLogin(HttpServletRequest request, Logger log) {
        try {
            String key = request.getHeader("Core-Key");
            log.info("filter header " + key + " path " + request.getServletPath() + " method: " + request.getMethod());
            String home = System.getProperty("user.home");
            Path p = new File(home, "core-key").toPath();
            if (key != null && Files.exists(p)) {
                String savedKey = Files.readString(p).trim();
                log.info("filter local core-key" + savedKey);
                return savedKey.equals(key);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return true;
    }
}
