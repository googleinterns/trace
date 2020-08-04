package com.google.sps.servlets;

import java.io.IOException;
import java.util.*;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import com.google.gson.Gson;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;

/** Servlet that returns user-generated comments.*/
@WebServlet("/places")
public class PlacesServlet extends HttpServlet {
  private DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

  /** Parameters: 
      @request - HttpServletRequest with parameter 'place_ID'. 
      @response - HttpServletResponse to be reset.
      Desc: This function retrieves all reviews with matching place_ID. */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String place_ID = request.getParameter("place_ID");

    // Consider all data involved as preliminary
    Filter placeFilter = new FilterPredicate("place_ID", FilterOperator.EQUAL, place_ID);
    Query query = new Query("Review").setFilter(placeFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    JSONArray reviews = new JSONArray();
    // Adds each review entity to a JSONArray.
    for (Entity entity : results.asIterable()) {
      JSONObject review = new JSONObject();
      review.put("message", (String) entity.getProperty("message"));
      review.put("fullName", (String) entity.getProperty("fullName"));
      review.put("timestamp", (Date) entity.getProperty("date"));

      // Currently includes total, positive, and negative votes. Not all need be displayed.
      review.put("total", (int) entity.getProperty("total"));
      review.put("positive", (int) entity.getProperty("positive"));
      review.put("negative", (int) entity.getProperty("negative"));
      review.put("rating", (int) entity.getProperty("rating"));
      reviews.add(review);
    }

    // Set response and return JSON.
    response.setContentType("application/json;");
    String json = new Gson().toJson(reviews);
    response.getWriter().println(json);
  }

  /** Parameters: 
      @request - HttpServletRequest with paremeter 'place_ID'. 
      @response - HttpServletResponse to be reset.
      Desc: This function creates a new placeEntity using a place_ID. */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    // Retrieve comment, comment quantity, and current user.
    String place_ID = request.getParameter("place_ID");

    // Create entity for datastore.
    Entity placeEntity = new Entity("place");
    placeEntity.setProperty("id", place_ID);
    placeEntity.setProperty("totalVotes", 0);
    placeEntity.setProperty("avgRating", 0);

    datastore.put(placeEntity);
    response.setContentType("text/html");
    response.sendRedirect("/index.html"); //Perhaps a different redirect may make more sense here.
  }
}