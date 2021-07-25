package com.storyteller_f.co_re.service;

import java.io.IOException;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.annotation.Resource;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.document.Document;
import org.apache.lucene.index.*;
import org.apache.lucene.queryparser.classic.ParseException;
import org.apache.lucene.queryparser.classic.QueryParser;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.search.Query;
import org.apache.lucene.search.ScoreDoc;
import org.apache.lucene.search.TopDocs;
import org.apache.lucene.store.FSDirectory;
import org.springframework.stereotype.Service;
import com.storyteller_f.co_re.CodeSnippet;

@Service
public class LuceneService {
    @Resource
    StandardAnalyzer analyzer;
    @Resource
    Path path;

    public long delete(int id) {
        IndexWriter indexWriter = null;
        FSDirectory directory = null;
        DirectoryReader open = null;
        try {
            directory = FSDirectory.open(path);
            IndexWriterConfig config = new IndexWriterConfig(analyzer);
            indexWriter = new IndexWriter(directory, config);
            open = DirectoryReader.open(indexWriter);
            return indexWriter.tryDeleteDocument(open, id);
        } catch (IOException e) {
            e.printStackTrace();
        }finally {
            close(indexWriter);
            close(directory);
            close(open);
        }
        return -5;
    }

    private void close(FSDirectory directory) {
        try {
            if (directory != null) {
                directory.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public boolean save(String title, String code) {
        Date date = new Date(System.currentTimeMillis());
        CodeSnippet codeSnippet = new CodeSnippet(title, code, date,0);
        IndexWriter indexWriter = null;
        try {
            FSDirectory directory = FSDirectory.open(path);
            IndexWriterConfig config = new IndexWriterConfig(analyzer);
            indexWriter = new IndexWriter(directory, config);
            indexWriter.addDocument(codeSnippet.get());
        } catch (IOException e) {
            e.printStackTrace();
            return false;
        } finally {
            close(indexWriter);
        }
        return true;
    }

    private void close(IndexWriter indexWriter) {
        if (indexWriter != null) {
            try {
                indexWriter.flush();
            } catch (IOException e) {
                e.printStackTrace();
            }
            try {
                indexWriter.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    public TopDocs search(String search) {
        DirectoryReader reader = null;
        try {
            FSDirectory directory = FSDirectory.open(path);
            reader = DirectoryReader.open(directory);
            IndexSearcher indexSearcher = new IndexSearcher(reader);
            QueryParser queryParser = new QueryParser("title", analyzer);
            Query parse = queryParser.parse(search);
            return indexSearcher.search(parse, 10);
        } catch (IOException | ParseException e) {
            e.printStackTrace();
        } finally {
            close(reader);
        }
        return null;
    }
    public List<CodeSnippet> all() {
        DirectoryReader reader = null;
        try {
            FSDirectory directory = FSDirectory.open(path);
            reader = DirectoryReader.open(directory);
            IndexSearcher indexSearcher = new IndexSearcher(reader);
            QueryParser queryParser = new QueryParser("title", analyzer);
            Query parse = queryParser.parse("*:*");
            TopDocs search = indexSearcher.search(parse, 100);
            List<CodeSnippet> list = new ArrayList<>();
            for (ScoreDoc scoreDoc : search.scoreDocs) {
                Document doc = indexSearcher.doc(scoreDoc.doc);
                list.add(CodeSnippet.to(doc,scoreDoc.doc));
            }
            return list;
        } catch (IOException | ParseException e) {
            e.printStackTrace();
        } finally {
            close(reader);
        }
        return null;
    }

    private void close(DirectoryReader reader) {
        try {
            if (reader != null) {
                reader.close();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

}
