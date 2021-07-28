package com.storyteller_f.co_re;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.Directory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;


@Configuration
public class Cofig {
    @Value("${app.lucenePosition}")
    String lucenePosition;
    @Bean
    public Path path() {
        Path path = Paths.get(lucenePosition);
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
