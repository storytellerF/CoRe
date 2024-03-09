package com.storyteller_f.co_re.controller;

import com.storyteller_f.co_re.CodeSnippet;
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
     * @return 返回-3 代表出现了错误。否则返回addDocument 的结果
     */
    @PostMapping("/add")
    public long add(String title, String codeContent) {
        return service.save(title, codeContent);
    }

    /**
     * 删除单个document
     * @param id document 的id
     * @return 返回-2 代表出现了错误。否则返回tryDeleteDocument 的结果
     */
    @PostMapping("/delete")
    public long delete(int id) {
        return service.delete(id);
    }

    /**
     * 修改单个document，id 必须存在
     * @param codeSnippet 新的内容
     * @return 如果返回-4，说明id == -1，如果返回-2，说明删除失败，如果返回-3，说明保存失败，其他代表编辑成功
     */
    @PostMapping("/edit")
    public long edit(CodeSnippet codeSnippet) {
        if (codeSnippet.getId() == -1) {
            return LuceneService.INVALID_ID_EXCEPTION;
        }
        long deleteResult = delete(codeSnippet.getId());
        if (deleteResult < 0) {
            return deleteResult;
        }
        return add(codeSnippet.getTitle(), codeSnippet.getCodeContent());
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
        return service.get(id);
    }
}
