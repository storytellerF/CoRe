package com.storyteller_f.co_re.controller;

import com.storyteller_f.co_re.CodeSnippet;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import com.storyteller_f.co_re.service.LuceneService;

@RestController
public class APIController {
	@Autowired
	LuceneService service;

	@PostMapping("/add")
	public boolean add(String title, String code) {
		return service.save(title, code);
	}
	@GetMapping("/delete")
	public long delete(int id) {
		return service.delete(id);
	}
	@PostMapping("/edit")
	public boolean edit(CodeSnippet codeSnippet) {
		long delete = delete(codeSnippet.getId());
		if (delete != -1) {
			return add(codeSnippet.getTitle(), codeSnippet.getCodeContent());
		}
		return false;
	}
}
