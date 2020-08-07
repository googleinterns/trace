package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.users.UserService;
import com.google.appengine.api.users.UserServiceFactory;
import com.google.sps.data.PlaceReviews;
import com.google.sps.data.Comment;
import com.google.sps.data.RatingHistory;
import java.util.*;
import java.io.IOException;
import com.google.gson.Gson;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/* Servlet that returns reviews.*/
@WebServlet("/review")
public class ReviewServlet extends HttpServlet {

  /**
  * fetch method: retrieves all reviews of a given place
  * @param request ServletRequest with field 'place_id'
  */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    String place_id = request.getParameter("place_id");
    List<PlaceReviews> allLocations = queryLocation(place_id);
    
    PlaceReviews location;
    if (allLocations.size() == 0) {
      location = null;
    } else {
      location = trimQuery(allLocations);
    }

    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(location);
    response.getWriter().println(json);
  }

  /** 
   * Retrieves data from new-review submission form and creates relevant entity.
   * Assumes user is logged in before posting review.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();

    // Currently unused.
    String firstName = request.getParameter("firstname");
    String lastName = request.getParameter("lastname");

    // Create new Comment instance.
    String userEmail = userService.getCurrentUser().getEmail(); // Used to restrict user to one review/location
    String reviewText = request.getParameter("comment");
    Date time = new Date();
    Comment newReview = new Comment(userEmail, reviewText, time);
    
    // Query for reviews from place_id.
    String place_id = request.getParameter("place_id");
    List<PlaceReviews> queryResults = queryLocation(place_id);

    // Post review.
    PlaceReviews curLocation;
    if (queryResults.size() == 0) { // There has not been a review before
      String ratingStr = request.getParameter("rate"); // Convert to double or keep as string?
      Double rating = Double.parseDouble(ratingStr);
      curLocation = new PlaceReviews(place_id, newReview, rating);
    } else { // Add review
      curLocation = trimQuery(queryResults);
      curLocation.addReview(newReview); // Handles duplicate
    }
    // TODO: Put back the new PlaceReviews
  
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
  public List<PlaceReviews> queryLocation(String place_id) {
    Filter placeFilter = new FilterPredicate("place_id", FilterOperator.EQUAL, place_id);
    Query query = new Query("PlaceReviews").setFilter(placeFilter);

    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    List<PlaceReviews> places = new ArrayList<PlaceReviews>();
    for (Entity entity : results.asIterable()) {
      PlaceReviews cur = (PlaceReviews) entity.getProperty("placeData");
      places.add(cur);
    }

    return places;
  }

  /**
   * Assert function
   * Helper function from query to ensure only one location has been returned
   * @return PlaceReviews single element
   */
  public PlaceReviews trimQuery(List<PlaceReviews> queryResults) throws IOException {
    if (queryResults.size() > 1 || queryResults.size() == 0) {
      throw new IOException("Database Error: Multiple locations with same ID.");
    } else {
      return queryResults.get(0);
    }
  }
}

