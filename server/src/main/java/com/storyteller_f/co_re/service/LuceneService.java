package com.storyteller_f.co_re.service;

import java.io.Closeable;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TermQuery;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import com.storyteller_f.CheckedFunction;
import com.storyteller_f.Utils;
import com.storyteller_f.co_re.CodeSnippet;
import com.storyteller_f.co_re.Response;

@Service
public class LuceneService {
    private static final int DELETE_EXCEPTION = -2;
    private static final int SAVE_EXCEPTION = -3;
    public static final int INVALID_ID_EXCEPTION = -4;
    public static final int FIND_NEW_CREATED_EXCEPTION = -5;

    @Resource
    StandardAnalyzer analyzer;
    @Resource
    Path path;

    @Resource
    FSDirectory directory;

    /**
     * 根据id 获取文档
     * 
     * @param id document 的id
     * @return 返回搜索到的snippet，可以为null
     */
    @Nullable
    public CodeSnippet get(int id) {
        try {
            Document document = useSearcher((searcher) -> {
                return searcher.doc(id);
            });
            document.forEach((a) -> {
                System.out.println(a.name());
            });
            return CodeSnippet.from(document, id);
        } catch (Throwable e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * tryDeleteDocument 的返回值是-1 或者 > 0，所有当前使用0 作为出现异常时的返回值
     * 
     * @param id 需要删除的id
     * @return 返回-2 代表出现了错误。否则返回tryDeleteDocument 的结果
     */
    public long delete(int id) {
        try {
            return useIndexWriter((writer) -> {
                return Utils.use(DirectoryReader.open(writer), (reader) -> {
                    return writer.tryDeleteDocument(reader, id);
                });
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return DELETE_EXCEPTION;
        }

    }

    /**
     * 保存到文档中
     * 
     * @param title 文档的标题
     * @param code  文档的内容
     * @return 返回-3 代表出现了错误。否则返回addDocument 的结果
     */
    public int add(String title, String code) {
        Date date = new Date(System.currentTimeMillis());
        String uuid = UUID.randomUUID().toString();
        CodeSnippet codeSnippet = new CodeSnippet(title, code, date, 0, uuid);

        try {
            useIndexWriter((writer) -> {
                return writer.addDocument(codeSnippet.get());
            });
            return useSearcher((searcher) -> {
                TopDocs topDocs = searcher.search(new TermQuery(new Term("uuid", uuid)), 1);
                long total = topDocs.totalHits.value;
                if (total > 0) {
                    return topDocs.scoreDocs[0].doc;
                } else {
                    return FIND_NEW_CREATED_EXCEPTION;
                }
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return SAVE_EXCEPTION;
        }

    }

    /**
     * 根据指定关键字搜索
     * 
     * @param search 关键字
     * @param start  需要跳过的数量
     * @param count  需要读取的数量
     * @return 返回搜索到的结果
     */
    public Response<CodeSnippet> search(String search, int start, int count) {
        Query query;
        if (search == null || search.isEmpty()) {
            query = new MatchAllDocsQuery();
        } else {
            try {
                query = new QueryParser(CodeSnippet.titleKey, analyzer).parse(search);
            } catch (Exception e) {
                e.printStackTrace();
                return null;
            }
        }
        try {
            return useSearcher((seacher) -> {
                TopDocs result = seacher.search(query, start + count);
                return readSnippet(seacher, result, start, count);
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return null;
        }
    }

    /**
     * 从搜索结果中读取出snippet
     * 
     * @param indexSearcher searcher
     * @param topDocs       搜索结果
     * @param start         需要跳过的数量
     * @param count         需要读取的数量
     * @return 返回处理后的结果
     */
    private Response<CodeSnippet> readSnippet(IndexSearcher indexSearcher, TopDocs topDocs, int start, int count) {
        long total = topDocs.totalHits.value;
        List<CodeSnippet> list = Arrays.stream(topDocs.scoreDocs).skip(start).limit(Math.min(count, total - start))
                .map(scoreDoc -> {
                    try {
                        Document doc = indexSearcher.doc(scoreDoc.doc);
                        return CodeSnippet.from(doc, scoreDoc.doc);
                    } catch (Throwable e) {
                        e.printStackTrace();
                        return null;
                    }
                }).collect(Collectors.toList());
        return new Response<CodeSnippet>(list, start, total);
    }

    /**
     * 便捷的使用searcher，自动关闭资源
     * 
     * @param <R>   返回值
     * @param block 对外的接口可以在安全的作用域内使用资源
     * @return 返回block 的返回值
     * @throws Exception
     */
    private <R> R useSearcher(CheckedFunction<IndexSearcher, R> block) throws Exception {
        return Utils.use(DirectoryReader.open(directory), (reader) -> {
            return block.apply(new IndexSearcher(reader));
        });
    }

    /**
     * 便捷的使用searcher，自动关闭资源
     * 
     * @param <R>   返回值
     * @param block 对外的接口可以在安全的作用域内使用资源
     * @return 返回block 的返回值
     * @throws Exception
     */
    private <R> R useIndexWriter(CheckedFunction<IndexWriter, R> block) throws Exception {
        return Utils.use(new IndexWriter(directory, new IndexWriterConfig(analyzer)), (writer) -> {
            return block.apply(writer);
        });
    }

}
