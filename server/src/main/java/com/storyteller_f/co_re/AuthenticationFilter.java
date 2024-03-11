package com.storyteller_f.co_re;

import java.io.IOException;
import java.io.File;
import java.nio.file.Files;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    static boolean skipAuth;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String key = request.getHeader("Core-Key");
        log.info("filter header " + key + " path " + request.getServletPath() + " method: " + request.getMethod());
        if (request.getMethod().equals("OPTIONS") || skipAuth) {
            filterChain.doFilter(request, response);
            return;
        }
        if (key != null) {
            String home = System.getProperty("user.home");
            String d = Files.readString(new File(home, "core-key").toPath()).trim();
            log.info("filter local core-key" + d);
            if (d.equals(key)) {
                filterChain.doFilter(request, response);
                return;
            }
            
        }

        // Reject the request and send an unauthorized error
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Unauthorized");
    }
}
