package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.PlaceReviews;
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

  /**
  * fetch method: retrieves all reviews of a given place
  * @param request ServletRequest with field 'place_id'
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String place_id = request.getParameter("place_id");
    List<PlaceReviews> allLocations = getLocation(place_id);
  
    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(allLocations);
    response.getWriter().println(json);
  }

  /** 
   * Retrieves data from new-review submission form and creates relevant entity.
   * Assumes user is logged in before posting review.
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    String place_id = request.getParameter("place_id");
    String userEmail = userService.getCurrentUser().getEmail(); // Used to restrict user to one review/location
    String reviewText = request.getParameter("comment");
    Date time = request.getParameter("timestamp");
    String firstName = request.getParameter("firstname");
    String lastName = request.getParameter("lastname");
    double rating = request.getParameter("rate");

    Comment newReview = new Comment(userEmail, newReview, time);
    PlaceReviews curLocation = new PlaceReviews(); // TODO grab current location by ID

    // TODO: Add or modify current review
    // TODO: Create new PlaceReviews and initialize

    // TODO: Put back the new PlaceReviews
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

  /**
   * This function interfaces with the ReviewServlet object
   */
  public void postComment(PlaceReviews location, Comment review) {
    location.addReview(review);
  }

  /**
   * Retrieval of PlaceReviews by id
   * @param place_id The Maps API id for a location
   * @return List<PlaceReviews> prepared query of the results, expected to be singleton
   */
  public List<PlaceReviews> getLocation(String place_id) {
    Filter placeFilter = new FilterPredicate("place_id", FilterOperator.EQUAL, place_id);
    Query query = new Query("PlaceReviews").setFilter(placeFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<PlaceReviews> places = new ArrayList<PlaceReviews>();
    for (Entity entity : results.asIterable()) {
      PlaceReviews cur = entity.getProperty("placeData");
      places.add(cur);
    }

    return places;
  }
}

