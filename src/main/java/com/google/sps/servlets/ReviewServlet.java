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
    System.out.println("AHHHHHHHHH");
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Entity curLocation = queryLocation(place_id, datastore);
    List<Comment> curReviews = new ArrayList<Comment>();
    if(curLocation != null) {
      PlaceReviews curPlace = (PlaceReviews) curLocation.getProperty("placeData");
      curReviews.addAll(curPlace.reviews);
    }
    System.out.println(curReviews);

    // Adds the review list to a GSON/JSON object so that can be used in Javascript code    
    response.setContentType("application/json");
    String json = new Gson().toJson(curLocation);
    response.getWriter().println(json);
  }

  /** 
   * Retrieves data from new-review submission form and creates relevant entity.
   * Assumes user is logged in before posting review.
   */
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    UserService userService = UserServiceFactory.getUserService();
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();

    // Currently unused.
    String firstName = request.getParameter("firstname");
    String lastName = request.getParameter("lastname");

    // Convert to double or keep as string?
    String ratingStr = request.getParameter("rate");
    Double rating = Double.parseDouble(ratingStr);

    // Create new Comment instance.
    String userEmail = userService.getCurrentUser().getEmail(); // Used to restrict user to one review/location
    String reviewText = request.getParameter("comment");
    Date time = new Date();
    Comment newReview = new Comment(userEmail, reviewText, time);
    
    // Query for reviews from place_id.
    String place_id = request.getParameter("place_id");
    Entity curLocation = queryLocation(place_id, datastore);

    datastore.put(setCurLocation(curLocation, newReview, rating, place_id)); // Appends new review before posting to the datastore.

    if (queryResults.size() == 0) { // There has not been a review before
      curLocation = new PlaceReviews(place_id, newReview, rating);
    } else { // Add review
      curLocation = trimQuery(queryResults);
      curLocation.addReview(newReview); // Handles duplicate
    }
    
    // Put back in datastore
    Entity locationEntity = new Entity("PlaceReviews", place_id); // Using place_id as the internal identifier
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(locationEntity);

    // Redirect back so review appears on screen
    response.sendRedirect("/index.html");
  }

  /**
    * Takes an entity and either appends a review or creates a new PlaceReviews instance
    * and appends it to the "placeData" property.
    * @param curLocation is an entity to be set and then returned to the datastore.
    * @param newReview is the Comment instance to be appended.
    * @param rating is the current location's rating.
    * @return curLocation is the final set entity to be added to the datastore.
    */
  public Entity setCurLocation(Entity curLocation, Comment newReview, Double rating, String place_id) {
    PlaceReviews curReviews;
    if (curLocation == null) { // There has not been a review before
      curLocation = new Entity("PlaceReviews");
      curReviews = new PlaceReviews(place_id, newReview, rating);
    } else { // Add review
      curReviews = (PlaceReviews) curLocation.getProperty("placeData");
      curReviews.addReview(newReview); // Handles duplicate
      curReviews.addRating(rating);
    }
    curLocation.setProperty("placeData", curReviews);
    return curLocation;
  }

  /**
   * Retrieval of PlaceReviews by id
   * @param place_id The Maps API id for a location
   * @param datastore Current DatastoreService for saving PlaceReviews
   * @return Returns zero or one Entities corresponding to the place being queried.
   */
  public Entity queryLocation(String place_id, DatastoreService datastore) {
    Filter placeFilter = new FilterPredicate("place_id", FilterOperator.EQUAL, place_id);
    Query query = new Query("PlaceReviews").setFilter(placeFilter);

    PreparedQuery results = datastore.prepare(query);

    List<Entity> places = new ArrayList<Entity>();
    for (Entity entity : results.asIterable()) {
      places.add(entity);
    }
    return trimQuery(places);
  }

  /**
   * Assert function
   * Helper function from query to ensure only one or no locations have been returned.
   * @return Returns zero or one Entities corresponding to the place being queried.
   */
  public Entity trimQuery(List<Entity> queryResults) /*throws IOException*/ {
    if (queryResults.size() > 1) {
      /***** TEMPORARY FIX TO DEBUG CODE. *****/
      /*** throw new IOException("Database Error: Multiple locations with same ID."); ***/
      return null;
    } else if(queryResults.size() == 0) {
      return null;
    }
    return queryResults.get(0);
  }
}

