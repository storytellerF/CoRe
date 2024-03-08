package com.storyteller_f.co_re;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import com.storyteller_f.co_re.controller.APIController;

@SpringBootTest
class CoReApplicationTests {


    @Autowired
	private APIController controller;

    @Test
    void contextLoads() {
        assertThat(controller).isNotNull();
    }

}
