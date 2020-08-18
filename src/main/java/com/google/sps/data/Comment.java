package com.google.sps.data;
import java.util.*;

/** 
 * Comment object class
 * This class decribes the Comment object, used in storing information about an individual review
 * that was left by a specific user. It works as an atomic block for keeping track of reviews.
 */
public class Comment {

  private final String author;
  private String messageContent;
  private Date timestamp;
  private long id;
  private Long negative;
  private Long positive;
  private String username;
  private String currUserVote;

  /**
   * Order Comparator
   * This comparator uses the compare function from the Date class to order Comments.
   */
  public static final Comparator<Comment> ORDER_BY_DATE = new Comparator<Comment>() {
    @Override
    public int compare(Comment a, Comment b) {
      return b.getTime().compareTo(a.getTime());
    }
  };

  /**
   * Order Comparator by Author
   * This comparator orders the comments by their author
   */
  public static final Comparator<Comment> ORDER_BY_AUTHOR = new Comparator<Comment>() {
    @Override
    public int compare(Comment a, Comment b) {
      return a.author.compareTo(b.author);
    }
  };

  /**
   * Order Comparator by MetaScore
   * This comparator orders the comments by their score
   */
  public static final Comparator<Comment> ORDER_BY_SCORE = new Comparator<Comment>() {
    @Override
    public int compare(Comment a, Comment b) {
      return (int) ((a.positive.longValue() - a.negative.longValue()) 
        - (b.positive.longValue() - b.negative.longValue()));
    }
  };
  
  /** 
   * Constructor
   * Creates a full Comment object, used when an author leaves a review for the first time
   * @param author the message author
   * @param message the content of the message
   * @param timestamp the time of writing
   */
  public Comment(String author, String message, Date timestamp, Long pos, Long neg) {
    this.author = author;
    this.messageContent = message;
    this.timestamp = timestamp;
    this.positive = pos;
    this.negative = neg;
    this.currUserVote = null;
  }

  /* Return the id of the comment */
  public long getId(){
    return this.id;
  }

  /* Set the id of the comment */
  public void setId(long id){
    this.id = id;
  }

  /* Sets the current user's vote */
  public boolean setVote(String vote){
    // Limits what we can set the vote to in order to reduce malicious behavior
    if (vote.equals("negative") || vote.equals("positive") || vote == null){
      currUserVote = vote;
      return true;
    } 
    return false;
  }

  /** 
   * Author Accessor method
   * Accesses private variable
   */
  public String getAuthor() {
    return this.author;
  }

  /** 
   * Message Accessor method
   * Accesses private variable
   */
  public String getMessage() {
    return this.messageContent;
  }

  /** 
   * Time Accessor method
   * Accesses private variable
   */
  public Date getTime() {
    return this.timestamp;
  }

  /** 
   * Update Comment
   * This function is used when a author want's to submit a new comment for a location.
   * This prevents the 'double voting' or 'duplicate feedback' of certain patrons.
   */
  public void updateComment(String message, Date timestamp) {
    this.messageContent = message;
    this.timestamp = timestamp;
  }

  /** 
   * Update Comment
   * This function is used when a author want's to submit a new comment for a location.
   * This prevents the 'double voting' or 'duplicate feedback' of certain patrons.
   */
  public void updateComment(Comment newReview) {
    this.messageContent = newReview.messageContent;
    this.timestamp = newReview.timestamp;
  }
}