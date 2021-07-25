package com.storyteller_f.co_re.controller;

import com.storyteller_f.co_re.CodeSnippet;
import com.storyteller_f.co_re.service.LuceneService;
import org.apache.lucene.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Controller
public class IndexController {
	@Autowired
	LuceneService service;
	@GetMapping({"/index","/"})
	public String index() {
		return "index";
	}
	@GetMapping("add")
	public String add() {
		return "add";
	}
	@GetMapping("/all")
	public String all(Model model) {
		List<CodeSnippet> all = service.all();
		model.addAttribute("list", all);
		return "show";
	}
	@GetMapping("/search")
	public String search(String search, Model model) {
		model.addAttribute("list", service.search(search));
		return "show";
	}
	@GetMapping("/edit")
	public String edit(int id,Model model) {
		Document indexableFields = service.get(id);
		model.addAttribute("item", CodeSnippet.to(indexableFields,id));
		return "edit";
	}
}
