package com.storyteller_f.co_re.controller;

import com.storyteller_f.co_re.CodeSnippet;
import org.apache.lucene.document.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestParam;

import com.storyteller_f.co_re.service.LuceneService;
import com.storyteller_f.co_re.Response;

@CrossOrigin
@RestController
public class APIController {
    @Autowired
    LuceneService service;

    @PostMapping("/add")
    public boolean add(String title, String codeContent) {
        return service.save(title, codeContent);
    }

    @PostMapping("/delete")
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

    @GetMapping("/all")
    public Response<CodeSnippet> all() {
        return service.all(0, 100);
    }

    @GetMapping("/search")
    public Response<CodeSnippet> search(@RequestParam("word") String word, @RequestParam("start") int start, @RequestParam("count") int count) {
        return service.search(word, start, count);
    }

    @GetMapping("/get")
    public CodeSnippet get(int id) {
        Document document = service.get(id);
        CodeSnippet snippet = CodeSnippet.from(document, id);
        return snippet;
    }
}
