package com.storyteller_f.co_re.service;

import java.io.Closeable;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import javax.annotation.Resource;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.MatchAllDocsQuery;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import com.storyteller_f.co_re.CodeSnippet;
import com.storyteller_f.co_re.Response;

@Service
public class LuceneService {
    private static final int DELETE_EXCEPTION = -2;
    private static final int SAVE_EXCEPTION = -3;
    public static final int INVALID_ID_EXCEPTION = -4;

    @Resource
    StandardAnalyzer analyzer;
    @Resource
    Path path;

    @Resource
    FSDirectory directory;

    /**
     * tryDeleteDocument 的返回值是-1 或者 > 0，所有当前使用0 作为出现异常时的返回值
     * @param id 需要删除的id
     * @return 返回-2 代表出现了错误。否则返回tryDeleteDocument 的结果
     */
    public long delete(int id) {
        try {
            return use(indexWriter(), (writer) -> {
                return use(DirectoryReader.open(writer), (reader) -> {
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
     * @param title 文档的标题
     * @param code 文档的内容
     * @return 返回-3 代表出现了错误。否则返回addDocument 的结果
     */
    public long save(String title, String code) {
        Date date = new Date(System.currentTimeMillis());
        CodeSnippet codeSnippet = new CodeSnippet(title, code, date, 0);

        try {
            return use(indexWriter(), (writer) -> {
                long number = writer.addDocument(codeSnippet.get());
                return number;
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return SAVE_EXCEPTION;
        } 

    }

    /**
     * 生成一个writer，用于保存内容
     * @return 返回生成的writer
     * @throws IOException
     */
    private IndexWriter indexWriter() throws IOException {
        return new IndexWriter(directory, new IndexWriterConfig(analyzer));
    }

    /**
     * 根据指定关键字搜索
     * @param search 关键字
     * @param start 需要跳过的数量
     * @param count 需要读取的数量
     * @return 返回搜索到的结果
     */
    public Response<CodeSnippet> search(String search, int start, int count) {
        if (search == null || search.isEmpty()) return all(start, count);
        try {
            Query parse = titleParser().parse(search);

            return useSearcher((seacher) -> {
                TopDocs result = seacher.search(parse, start + count);
                return readSnippet(seacher, result, start, count);
            });
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 创建一个使用title 作为搜索关键词的Parser
     * @return 生成的Parser，每次都会重新生成
     */
    private QueryParser titleParser() {
        return new QueryParser(CodeSnippet.titleKey, analyzer);
    }

    /**
     * 从搜索结果中读取出snippet
     * @param indexSearcher searcher
     * @param search1 搜索结果
     * @param start 需要跳过的数量
     * @param count 需要读取的数量
     * @return 返回处理后的结果
     */
    private Response<CodeSnippet> readSnippet(IndexSearcher indexSearcher, TopDocs search1, int start, int count) {
        long total = search1.totalHits.value;
        List<CodeSnippet> list = Arrays.stream(search1.scoreDocs).skip(start).limit(Math.min(count, total - start)).map(scoreDoc -> {
            try {
                Document doc = indexSearcher.doc(scoreDoc.doc);
                return CodeSnippet.from(doc, scoreDoc.doc);
            } catch (Throwable e) {
                e.printStackTrace();
                return null;
            }
        }).collect(Collectors.toList());
        Response<CodeSnippet> res = new Response<CodeSnippet>(list, start, total);
        return res;
    }

    /**
     * 获取指定范围内的结果
     * @param start
     * @param count
     * @return 返回搜索到结果
     */
    public Response<CodeSnippet> all(int start, int count) {
        try {
            Query parse = new MatchAllDocsQuery();

            return useSearcher((searcher) -> {
                TopDocs result = searcher.search(parse, start + count);
                return readSnippet(searcher, result, start, count);
            });
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 根据id 获取文档
     * @param id document 的id
     * @return 返回搜索到的snippet，可以为null
     */
    @Nullable
    public CodeSnippet get(int id) {
        try {
            Document document = useSearcher((searcher) -> {
                return searcher.doc(id);
            });
            CodeSnippet snippet = CodeSnippet.from(document, id);
            return snippet;
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;
    }

    /**
     * 便捷的使用searcher，自动关闭资源
     * @param <R> 返回值
     * @param block 对外的接口可以在安全的作用域内使用资源
     * @return 返回block 的返回值
     * @throws Exception
     */
    private <R> R useSearcher(CheckedFunction<IndexSearcher, R> block) throws Exception {
        return use(DirectoryReader.open(directory), (reader) -> {
            return block.apply(new IndexSearcher(reader));
        });
    }

    /**
     * 可以在作用域结束时自动回收资源
     * @param <T> 可回收资源的类型
     * @param <R> 返回值的类型
     * @param t 可回收的资源
     * @param block 对外的接口可以在安全的作用域内使用资源
     * @return 返回block 的返回值
     * @throws Exception
     */
    private <T extends Closeable, R> R use(T t, CheckedFunction<T, R> block) throws Exception {
        try {
            return block.apply(t);
        } finally {
            try {
                if (t != null) {
                    t.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

    }

}

@FunctionalInterface
interface CheckedFunction<T, R> {
    R apply(T t) throws Exception;
}