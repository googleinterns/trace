package com.google.sps.data;

import java.util.Date;

public class Comment {

  private final String author;
  private final String messageContent;
  private final Date timeStamp;

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

}