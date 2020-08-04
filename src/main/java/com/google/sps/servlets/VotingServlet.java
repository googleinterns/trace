package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
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

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
      
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    int id = 0; //(int) request.getParameter("review-id");
    int value = 0; //(int) request.getParameter("vote");

    // Find the review that corresponds to the given id
    // TODO: Modify query to find review that corresponds to the id. 
    Query query = new Query("Review"); 

    PreparedQuery results = datastore.prepare(query);

    // Check to make sure the datastore returned something
    if (results.asSingleEntity() != null){
      Entity review = results.asSingleEntity();
      int positive = (int) review.getProperty("positive");
      int negative = (int) review.getProperty("negative");
      if (value == 1){
        review.setProperty("positive", positive + 1);
        positive++;
      } else {
        review.setProperty("negative", negative + 1);
        negative++;
      }

      review.setProperty("total", positive - negative);

      // Adds the review back to the Datastore
      datastore.put(review);

    }
    // Redirect back
    // TODO: Update value in place without redirecting
    response.sendRedirect("/index.html");
  }
}