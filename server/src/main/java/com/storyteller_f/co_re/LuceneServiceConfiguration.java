package com.storyteller_f.co_re;

import org.apache.lucene.analysis.standard.StandardAnalyzer;
import org.apache.lucene.index.DirectoryReader;
import org.apache.lucene.index.IndexWriter;
import org.apache.lucene.index.IndexWriterConfig;
import org.apache.lucene.search.IndexSearcher;
import org.apache.lucene.store.FSDirectory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class LuceneServiceConfiguration {
    private static final String userHomeLabel = "~";

    @Value("${app.lucenePosition}")
    String lucenePosition;

    @Bean
    public Path path() throws IOException {
        Path path;
        if (lucenePosition.startsWith(userHomeLabel)) {
            String userHome = System.getProperty("user.home");
            path = Paths.get(userHome, lucenePosition.substring(1));
        } else {
            path = Paths.get(lucenePosition);
        }
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        return path;
    }

    @Bean
    public StandardAnalyzer analyzer() {
        return new StandardAnalyzer();
    }

    @Bean(destroyMethod = "close")
    public FSDirectory directory(@Qualifier("path") Path path) throws IOException {
        return FSDirectory.open(path);
    }

    public DirectoryReader reader(@Qualifier("indexWriter") IndexWriter indexWriter) throws IOException {
        return DirectoryReader.open(indexWriter);
    }

    public IndexSearcher indexSearcher(@Qualifier("reader") DirectoryReader reader) {
        return new IndexSearcher(reader);
    }

    public IndexWriterConfig indexWriterConfig(@Qualifier("analyzer") StandardAnalyzer analyzer) {
        IndexWriterConfig indexWriterConfig = new IndexWriterConfig(analyzer);
        return indexWriterConfig;
    }

    public IndexWriter indexWriter(@Qualifier("directory") FSDirectory directory,
            @Qualifier("indexWriterConfig") IndexWriterConfig config) throws IOException {
        return new IndexWriter(directory, config);
    }

}
