package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import java.util.*;
import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that allows users to vote on the reviews.*/
@WebServlet("/vote")
public class VotingServlet extends HttpServlet {

  /* Captures request to vote and records it in the appropriate entity. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    String value = request.getParameter("value");

    System.out.println(value);

    // Find the review that corresponds to the clicked review
    String review_ID = request.getParameter("review_ID");
    System.out.println(review_ID);

    Filter reviewFilter = new FilterPredicate("review_ID", FilterOperator.EQUAL, review_ID);
    Query query = new Query("Review").setFilter(reviewFilter);

    PreparedQuery results = datastore.prepare(query);

    // Check to make sure the datastore returned something
    if (results.asSingleEntity() != null){
      Entity review = results.asSingleEntity();
      int total = (int) review.getProperty("total");
      if (value == "1"){
        int positive = (int) review.getProperty("positive");
        review.setProperty("positive", ++positive);
        review.setProperty("total", ++total);
      } else {
        int negative = (int) review.getProperty("negative");
        review.setProperty("negative", --negative);
        review.setProperty("total", --total);
      }

      // Adds the review back to the Datastore
      datastore.put(review);

    }
    // Redirect back
    // TODO: Update value in place without redirecting
    response.sendRedirect("/index.html");
  }
}