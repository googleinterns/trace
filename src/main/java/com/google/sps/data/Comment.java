package com.google.sps.data;

import java.util.Date;

public class Comment {

  private final String author;
  private final String messageContent;
  private final Date timeStamp;

  public static final Comparator<Comment> ORDER_BY_DATE = new Comparator<Comment>() {
    @Override
    public int compare(Comment a, Comment b) {
      return a.getTime().compareTo(b.getTime());
    }
  }
  
  public Comment(String author, String message, Date timeStamp) {
    this.author = author;
    this.messageContent = message;
    this.timeStamp = timeStamp;
  }

  public String getAuthor() {
    return this.author;
  }

  public String getMessage() {
    return this.messageContent;
  }

  public Date getTime() {
    return this.timeStamp;
  }

  public void updateComment(String message, Date timeStamp) {
    this.messageContent = message;
    this.timeStamp = timeStamp;
  }
}