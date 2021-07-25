package com.storyteller_f.co_re;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.apache.lucene.analysis.Analyzer;
import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.apache.lucene.store.FSDirectory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class Cofig {

    @Bean
    public Path path() {
        Path path = Paths.get("E:\\测试\\CoRe\\index");
        try {
            if (!Files.exists(path)) {
                return Files.createDirectory(path);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return path;
    }

    @Bean
    public StandardAnalyzer analyzer() {
        return new StandardAnalyzer();
    }

//    @Bean
    public IndexSearcher indexSearcher(@Qualifier("directory") Directory directory) {
        DirectoryReader reader;
        try {
            reader = DirectoryReader.open(directory);
            return new IndexSearcher(reader);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
