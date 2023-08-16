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

    /**
     * 添加document
     * @param title snippt 的标题
     * @param codeContent snippet 的内容
     */
    @PostMapping("/add")
    public boolean add(String title, String codeContent) {
        return service.save(title, codeContent);
    }

    /**
     * 删除单个document
     */
    @PostMapping("/delete")
    public long delete(int id) {
        return service.delete(id);
    }

    /**
     * 修改单个document，如果id 是-1，等同于/add
     */
    @PostMapping("/edit")
    public boolean edit(CodeSnippet codeSnippet) {
        long delete = delete(codeSnippet.getId());
        if (delete != -1) {
            return add(codeSnippet.getTitle(), codeSnippet.getCodeContent());
        }
        return false;
    }

    /**
     * 返回所有的snippet
     * @param start 从0 开始
     * @param count 从start 开始查询多少个
     */
    @GetMapping("/all")
    public Response<CodeSnippet> all(@RequestParam("start") int start, @RequestParam("count") int count) {
        return service.all(start, count);
    }

    /**
     * @param word 搜索的关键字。如果为空或者是null，等同于/all
     * @param start 从0 开始
     * @param count 从start 开始查询多少个
     */
    @GetMapping("/search")
    public Response<CodeSnippet> search(@RequestParam("word") String word, @RequestParam("start") int start, @RequestParam("count") int count) {
        return service.search(word, start, count);
    }

    /**
     * 查询单个snippet
     * @param id document 的id
     */
    @GetMapping("/get")
    public CodeSnippet get(int id) {
        Document document = service.get(id);
        CodeSnippet snippet = CodeSnippet.from(document, id);
        return snippet;
    }
}
