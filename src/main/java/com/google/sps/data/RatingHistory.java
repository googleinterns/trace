package com.google.sps.data;

import java.util.Date;
import java.util.List;

public class RatingHistory {

  private final Date start;
  private int length;
  private List<double> history;

  public RatingHistory(Date start) {
    this.start = start;
  }

  public List<double> getHistory() {
    return this.history();
  }

}