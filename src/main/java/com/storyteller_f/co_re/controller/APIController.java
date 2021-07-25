package com.storyteller_f.co_re.controller;

import com.storyteller_f.co_re.CodeSnippet;
import org.apache.lucene.search.TopDocs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.storyteller_f.co_re.service.LuceneService;

import java.util.List;

@RestController
public class APIController {
	@Autowired
	LuceneService service;
	@GetMapping("/search")
	public TopDocs search(String search) {
		return service.search(search);
	}

	@PostMapping("/add")
	public boolean add(String title, String code) {
		return service.save(title, code);
	}
	@GetMapping("/delete")
	public long delete(int id) {
		return service.delete(id);
	}
}
