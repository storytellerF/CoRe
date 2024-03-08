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
import org.springframework.stereotype.Service;
import com.storyteller_f.co_re.CodeSnippet;
import com.storyteller_f.co_re.Response;

@Service
public class LuceneService {
    @Resource
    StandardAnalyzer analyzer;
    @Resource
    Path path;

    @Resource
    FSDirectory directory;

    public long delete(int id) {
        try {
            return use(indexWriter(), (writer) -> {
                return use(DirectoryReader.open(writer), (reader) -> {
                    return writer.tryDeleteDocument(reader, id);
                });
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return -5;
        }
        
    }

    public boolean save(String title, String code) {
        Date date = new Date(System.currentTimeMillis());
        CodeSnippet codeSnippet = new CodeSnippet(title, code, date, 0);

        try {
            return use(indexWriter(), (writer) -> {
                writer.addDocument(codeSnippet.get());
                return true;
            });
        } catch (Throwable e) {
            e.printStackTrace();
            return false;
        } 

    }

    private IndexWriter indexWriter() throws IOException {
        return new IndexWriter(directory, new IndexWriterConfig(analyzer));
    }

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

    private QueryParser titleParser() {
        return new QueryParser(CodeSnippet.titleKey, analyzer);
    }

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

    public Document get(int id) {
        try {
            return useSearcher((searcher) -> {
                return searcher.doc(id);
            });
        } catch (Throwable e) {
            e.printStackTrace();
        }
        return null;
    }

    private <R> R useSearcher(CheckedFunction<IndexSearcher, R> block) throws Exception {
        return use(DirectoryReader.open(directory), (reader) -> {
            return block.apply(new IndexSearcher(reader));
        });
    }

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