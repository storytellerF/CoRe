package com.storyteller_f.co_re;

import java.io.IOException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthenticationFilter extends OncePerRequestFilter {

    static boolean skipAuth;

    AuthCenter center = new AuthCenter();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        if (request.getMethod().equals("OPTIONS") || skipAuth) {
            filterChain.doFilter(request, response);
            return;
        }

        boolean isLogin = center.isLogin(request, log);
        if (isLogin) {
            filterChain.doFilter(request, response);
            return;
        }

        // Reject the request and send an unauthorized error
        response.addHeader("Access-Control-Allow-Origin", "*");
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write("Unauthorized");
    }
}
