package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import java.util.*;
import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns reviews.*/
@WebServlet("/review")
public class ReviewServlet extends HttpServlet {

  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Consider all data involved as preliminary
    Query query = new Query("Review").addSort("date", SortDirection.DESCENDING);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<String> reviews = new ArrayList<>();
    // Adds each review entity to a list
    for (Entity entity : results.asIterable()) {
      // Get desired information from Datastore
      long id = entity.getKey().getId();
      String message = (String) entity.getProperty("message");
      Date timestamp = (Date) entity.getProperty("date");
      long total = (long) entity.getProperty("total");
      reviews.add(message + " - " + timestamp.toString() + " ; " + total);
    }

    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(reviews);
    response.getWriter().println(json);
  }

  /** Retrieves data from new-review submission form and creates relevant entity.
      Assumes user is logged in before posting review. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    String userEmail = userService.getCurrentUser().getEmail(); // Used to restrict user to one review/location
    String newReview = request.getParameter("comment");
    String firstName = request.getParameter("firstname");
    String lastName = request.getParameter("lastname");
    String rating = request.getParameter("rate");
    String place_id = request.getParameter("place_id");

    if (newReview != null && newReview.length() > 0){
      // Entity containing public reviews
      Entity reviewEntity = new Entity("Review");
      reviewEntity.setProperty("rating", rating);
      Date date = new Date();
      reviewEntity.setProperty("date", date);

      reviewEntity.setProperty("message", newReview);
      reviewEntity.setProperty("fullName", firstName + " " + lastName);
      reviewEntity.setProperty("rating", rating);
      reviewEntity.setProperty("email", userEmail);
      reviewEntity.setProperty("place_id", place_id);
      
      // Total + Postive + Negative all set at 0 to start.
      reviewEntity.setProperty("total", 0);
      reviewEntity.setProperty("negative", 0);
      reviewEntity.setProperty("positive", 0);

      // Add the new review to a Datastore
      DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
      datastore.put(reviewEntity);
    }
    // Redirect back so review appears on screen
    response.sendRedirect("/index.html");
  }
}