package com.storyteller_f.co_re;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.web.server.LocalServerPort;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * HttpRequestTest
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
public class HttpRequestTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testDeleteResultWhenError() throws Exception {
        AuthenticationFilter.skipAuth = true;
        Object r = restTemplate.postForObject("http://localhost:" + port + "/apis/delete?id=100000", null,
                Object.class);
        assertThat(r).isEqualTo(-2);
    }

}